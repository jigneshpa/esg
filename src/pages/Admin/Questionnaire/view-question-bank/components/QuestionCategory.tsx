import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Progress,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";

import { userApi } from "@/store/api/user/userApi";
import { useAppSelector } from "@/store/hooks";
import {
  selectUserCompanyId,
  selectUserRole,
} from "@/store/slices/user/userSelectors";
import { Category, Question, QuestionStatus } from "@/types/question";
import { getStatusColor } from "@/utils";

import AssignCategoryModal from "./AssignCategoryModal";
import QuestionForm from "./QuestionForm";
import { QUESTION_FORM_PAGE_TYPE } from "@/constants";

export interface QuestionWithStatus extends Question {
  status: QuestionStatus;
}

interface UserMatch {
  username: string;
  companyId: number | null;
  userId?: number | null;
}

interface QuestionCategoryProps {
  category: string;
  questions: QuestionWithStatus[];
  categories?: Category[];
  onUpdateQuestionCategory?: (
    questionId: number,
    categoryId: number
  ) => Promise<void>;
  filteredUsers?: any[];
  year?: number;
  isViewPage: boolean;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    questions: QuestionWithStatus[];
    matchingUsers: UserMatch[];
    categories: Category[];
    onUpdateQuestionCategory?: (
      questionId: number,
      categoryId: number
    ) => Promise<void>;
    filteredUsers: any[];
    listRef?: React.RefObject<any>;
    year?: number;
    isViewPage?: boolean;
  };
}

// Create a height cache outside component to persist between renders
const heightCache = new Map();

// Modify the Row component to measure heights
const Row = memo(({ index, style, data }: RowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const question = data.questions[index];
  const [height, setHeight] = useState<number>(heightCache.get(index) || 400);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Find parent question if this is a child question
  const parentQuestion = question.parentId
    ? data.questions.find((q) => q.id === question.parentId)
    : null;
  // console.log('parent question is ', parentQuestion);
  useEffect(() => {
    // Create ResizeObserver to track height changes
    const resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const newHeight = contentRef.current.offsetHeight;
          if (newHeight > 0 && (isInitialRender || newHeight !== height)) {
            setHeight(newHeight);
            heightCache.set(index, newHeight);
            if (data.listRef?.current) {
              data.listRef.current.resetAfterIndex(index, false);
            }
            if (isInitialRender) {
              setIsInitialRender(false);
            }
          }
        }
      });
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [index, data.listRef, height, isInitialRender]);

  // Calculate the final style with the measured height
  const finalStyle: React.CSSProperties = {
    ...style,
    position: "absolute",
    top: style.top,
    left: 0,
    width: "100%",
    height: height,
    transition: isInitialRender ? "none" : "height 0.2s ease-in-out",
  };

  const relevantAnswerData = question?.answer
    ?.slice()
    ?.reverse()
    ?.find((ans: any) =>
      data.matchingUsers.map((user: any) => user.userId).includes(ans.user_id)
    );
  const answerData = {
    answer: relevantAnswerData?.selectedAnswer || null,
    remarks: relevantAnswerData?.remarks || null,
    attachmentData: relevantAnswerData?.files || null,
  };

  if (question.type === "radio") {
    answerData.answer = JSON.parse(answerData.answer)?.radioOptions || null;
  } else if (question.type === "dropDown") {
    answerData.answer = answerData.answer;
  }
  return (
    <Box ref={ref} style={finalStyle}>
      <Box ref={contentRef} position="relative">
        {/* Show current question */}
        <QuestionForm
          question={question}
          answerData={answerData || {}}
          parentQuestion={parentQuestion}
          index={Number(question.displayNo)}
          displayIndex={question.displayNo}
          mode="view"
          categories={data.categories}
          matchingUsers={data.matchingUsers}
          onUpdateQuestionCategory={data.onUpdateQuestionCategory}
          year={data.year}
          pageType={QUESTION_FORM_PAGE_TYPE.QUESTION_BANK_VIEW}
          isViewPage={data.isViewPage}
        />
      </Box>
    </Box>
  );
});

Row.displayName = "Row";

const QuestionCategory = ({
  category,
  questions,
  categories = [],
  onUpdateQuestionCategory,
  filteredUsers = [],
  year,
  isViewPage,
}: QuestionCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const userRole = useAppSelector(selectUserRole);
  const companyId = useAppSelector(selectUserCompanyId);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const subsidiaryId = useMemo(() => {
    const subsidiaryIdStr = sessionStorage.getItem("selectedSubsidiaryId");
    return subsidiaryIdStr ? parseInt(subsidiaryIdStr, 10) : companyId;
  }, [companyId]);
  console.log("selected subsidiary id is ", subsidiaryId);

  const storedSubsidiaryIds = useMemo(() => {
    return JSON.parse(sessionStorage.getItem("subsidiaryIds") || "[]");
  }, []);
  console.log("subsidiaryIds", storedSubsidiaryIds);

  const { companySelected } = useParams<{ companySelected?: string }>();
  const companySelectedNum = companySelected
    ? Number(companySelected)
    : undefined;
  console.log("companySelectedNum is ", companySelectedNum);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [userData, setUserData] = useState<{ [key: number]: any }>({});
  const [matchingUsers, setMatchingUsers] = useState<UserMatch[]>(() => {
    const storedMatchingUsers = sessionStorage.getItem("matchingUsers");
    return storedMatchingUsers ? JSON.parse(storedMatchingUsers) : [];
  });
  const [isLoading, setIsLoading] = useState(userRole === "user-admin");
  console.log("user role is ", userRole);
  // Replace the useGetUsersQuery with userApi.useGetUserListQuery
  const { data: usersData, isLoading: isUsersLoading } =
    userApi.useGetUserListQuery({
      page: 1,
      max_results: 100000000000,
      companyIds: companySelectedNum ? [companySelectedNum] : [],
      roles: ['user'],
    });

  // Transform users data for the modal
  const transformedUsers = useMemo(() => {
    if (!usersData?.data?.items) return [];
    return usersData.data.items
      .filter(
        (user: {
          id: number;
          userName: string;
          firstName: string;
          lastName: string;
          email: string;
          roleId?: number;
          role?: string;
          department_info?: {
            name: string;
          };
        }) => {
          // Filter to only include users with Employee role
          // Check both roleId (1 = Employee) and role string ('Employee')
          return user.roleId === 1 || user.role === "Employee";
        }
      )
      .map(
        (user: {
          id: number;
          userName: string;
          firstName: string;
          lastName: string;
          email: string;
          department_info?: {
            name: string;
          };
        }) => ({
          id: user.id.toString(),
          name: user.userName || `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          department: user.department_info?.name,
        })
      );
  }, [usersData]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!subsidiaryId) {
        setIsLoading(false);
        console.log("subsidiaryId not found");
      }
      console.log("questions is ", questions);
      const userIds = questions
        .flatMap((question) => question.users || [])
        .map((user) => user.id)
        .filter((id, index, self) => self.indexOf(id) === index);

      if (userIds.length === 0) {
        setIsLoading(false);
        return;
      }
      console.log("userIds", userIds);

      let token: string | undefined;
      const greenFiTokenFromSession = sessionStorage.getItem("greenFiToken");
      const greenFiTokenFromLocal = localStorage.getItem("greenFiToken");

      if (greenFiTokenFromSession) {
        const parsedToken = JSON.parse(greenFiTokenFromSession);
        token = parsedToken?.accessToken;
      } else if (greenFiTokenFromLocal) {
        const parsedToken = JSON.parse(greenFiTokenFromLocal);
        token = parsedToken?.accessToken;
      }

      if (!token) {
        console.error("No valid token found in sessionStorage or localStorage");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchPromises = userIds.map(async (id) => {
          const response = await axios.post(
            "https://aogx4497ue.execute-api.ap-southeast-1.amazonaws.com/dev/getSingleUser",
            // 'http://localhost:3005/getSingleUser',
            { userId: id },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return { id, data: response.data };
        });

        const results = await Promise.all(fetchPromises);
        const userDataMap = results.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {} as { [key: number]: any });

        setUserData(userDataMap);
        console.log("userData is", userDataMap);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole === "user-admin" || userRole === "admin") {
      fetchUserData();
    } else if (isExpanded) {
      fetchUserData();
    }
  }, [userRole, subsidiaryId, questions, isExpanded]);

  let subsidiaryIdsArray: number[] = [];
  useEffect(() => {
    // New logic
    let matchedUsers: UserMatch[] = [];
    if (Object.keys(userData).length > 0) {
      Object.values(userData).forEach((userObj: any) => {
        const userCompanyId = userObj?.user?.company_id;
        const userId = userObj?.user?.id;
        console.log("user company ids from userData", userCompanyId);
        console.log(
          "subsidiary id array to check the match",
          subsidiaryIdsArray
        );
        if (userCompanyId === companySelectedNum) {
          console.log(
            "Successfully matched company ID from user data",
            userCompanyId
          );
          matchedUsers.push({
            username: userObj.user.user_name,
            companyId: userCompanyId,
            userId: userId,
          });
        }
      });
    }

    console.log("matched users is", matchedUsers);
    console.log("userData users is", userData);
    if (JSON.stringify(matchedUsers) !== JSON.stringify(matchingUsers)) {
      setMatchingUsers(matchedUsers);
      sessionStorage.setItem("matchingUsers", JSON.stringify(matchedUsers));
      console.log("matching users updated", matchedUsers);
    }
  }, [userData, userRole, subsidiaryId, companyId, storedSubsidiaryIds]);

  const getProgress = () => {
    const totalQuestions = questions.length;
    if (userRole === "user-admin" || userRole === "admin") {
      if (isLoading) {
        return { completed: 0, total: totalQuestions };
      }
      const answeredCount = questions.filter((q) => {
        const relevantAnswerData = q?.answer
          ?.slice()
          ?.reverse()
          ?.find((ans: any) =>
            matchingUsers.map((user: any) => user.userId).includes(ans.user_id)
          );
        return relevantAnswerData ? true : false;
      }).length;
      return { completed: answeredCount, total: totalQuestions };
    } else {
      const completedCount = questions.filter(
        (q) => q.status === "COMPLETED"
      ).length;
      return { completed: completedCount, total: totalQuestions };
    }
  };

  const getProgressPercentage = () => {
    const { completed, total } = getProgress();
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getQuestionProgressStatus = () => {
    const { completed, total } = getProgress();
    if (completed === total && total > 0) {
      return "COMPLETED";
    } else if (completed > 0) {
      return "ONGOING";
    } else {
      return "PENDING";
    }
  };

  const getProgressBarColor = () => {
    const { completed, total } = getProgress();
    if (completed === total && total > 0) {
      return "green";
    } else if (completed > 0) {
      return "purple";
    }
  };

  const { completed, total } = getProgress();

  // Add list ref
  const listRef = useRef<any>(null);

  // Add getItemSize callback
  const getItemSize = useCallback(
    (index: number) => heightCache.get(index) || 400,
    []
  );

  // Clear height cache when questions change
  useEffect(() => {
    heightCache.clear();
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [questions]);

  if (typeof category !== "string") {
    return null;
  }

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      mb={2}
      bg={bgColor}
      overflow="hidden"
    >
      <Flex
        p={4}
        alignItems="center"
        justifyContent="space-between"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box flex="1">
          <HStack justifyContent="space-between">
            <Flex alignItems="center" mb={2}>
              <Text fontWeight="bold" mr={4}>
                {category}
              </Text>
              {!isViewPage && <><Text fontSize="sm" color="gray.500">
                {isLoading ? "Loading..." : `(${completed}/${total})`}
              </Text>
              <Button
                ml={4}
                colorScheme="blue"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
              >
                Assign Category
              </Button>
              </>}
            </Flex>
            {!isViewPage && <HStack width="30%" justifyContent={"space-between"}>
              <Box>
                <Badge
                  mb={4}
                  colorScheme={getStatusColor(getQuestionProgressStatus())}
                  fontSize="sm"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {getQuestionProgressStatus()?.charAt(0).toUpperCase() +
                    getQuestionProgressStatus()?.slice(1)?.toLowerCase()}
                </Badge>
              </Box>
              <Box mb={4} width="70%">
                <Flex alignItems="center" gap={2}>
                  <Progress
                    value={getProgressPercentage()}
                    size="lg"
                    colorScheme={getProgressBarColor()}
                    borderRadius="full"
                    isIndeterminate={isLoading}
                    flex="1"
                  />
                  <Text fontSize="sm" color="gray.500" minW="45px">
                    {Math.round(getProgressPercentage())}%
                  </Text>
                </Flex>
              </Box>
            </HStack>}
          </HStack>
        </Box>
        <IconButton
          aria-label={isExpanded ? "Collapse" : "Expand"}
          icon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          variant="ghost"
          size="sm"
        />
      </Flex>

      {isExpanded && (
        <Box p={4} height="calc(100vh - 300px)" minHeight="600px">
          <AutoSizer>
            {({ height, width }) => (
              <VariableSizeList
                ref={listRef}
                height={height}
                width={width}
                itemCount={questions.length}
                itemSize={getItemSize}
                itemData={{
                  questions,
                  matchingUsers,
                  categories,
                  onUpdateQuestionCategory,
                  filteredUsers,
                  listRef,
                  year,
                  isViewPage
                }}
                overscanCount={5}
              >
                {Row}
              </VariableSizeList>
            )}
          </AutoSizer>
        </Box>
      )}

      <AssignCategoryModal
        isOpen={isOpen}
        onClose={onClose}
        filteredUsers={transformedUsers}
        isLoading={isUsersLoading}
        questions={questions}
        questionBankId={questions[0]?.questionBankId}
        companyId={companySelectedNum || companyId}
        year={year}
      />
    </Box>
  );
};

export default memo(QuestionCategory);
