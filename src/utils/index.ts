import { GREENFI_NOTIFICATION_KEY, GREENFI_STORAGE_KEY } from '@/constants';
import { Question, QuestionStatus } from '@/types/question';

/**
 * Replace string:
 * @param {*} string: string needs to be replaced
 * @param {*} mapObj: format like
 *  {
 *    match_1: replacement_1,
 *    match_2: replacement_2,
 *    ...
 *  }
 * @returns new string that has been replaced by replacement_1, replacement_2 ...
 */
const replaceString = (string: any, mapObj: any) => {
  return Object.keys(mapObj).reduce((prev, current) => prev.replace(current, mapObj[current]), string);
};

const getStatusColor = (status: QuestionStatus) => {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'ONGOING':
      return 'purple';
    case 'PENDING':
      return 'yellow';
    default:
      return 'blue';
  }
};
// const getStatusCount = (data: any, status: any) => {
//   return data?.filter((item: any) => item?.status === status).length;
// };

const getAccessToken = () => {
  const localTokens = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);
  return localTokens ? JSON.parse(localTokens).accessToken : null;
};

const formatFileUrlWithToken = (url: any) => {
  try {
    const result = new URL(url);
    result.searchParams.append('token', getAccessToken());
    return result.href;
  } catch {
    // Return null if url is invalid:
    return null;
  }
};

/* @ts-ignore */
const getNotificationKey = () => JSON.parse(localStorage.getItem(GREENFI_NOTIFICATION_KEY) as string);

const setNotificationKey = (key: any) => localStorage.setItem(GREENFI_NOTIFICATION_KEY, JSON.stringify(key));

// Debug utility to test localStorage
export const testLocalStorage = () => {
  try {
    const testKey = 'test_persistence';
    const testValue = { test: true, timestamp: Date.now() };

    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');

    console.log('LocalStorage test:', {
      canWrite: true,
      canRead: true,
      retrieved,
      matches: JSON.stringify(retrieved) === JSON.stringify(testValue)
    });

    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error('LocalStorage test failed:', error);
    return false;
  }
};

// Debug utility to check Redux persist state
export const debugPersistState = () => {
  try {
    const persistKey = 'persist:user';
    const persistData = localStorage.getItem(persistKey);

    console.log('Redux persist debug:', {
      persistKey,
      hasData: !!persistData,
      data: persistData ? JSON.parse(persistData) : null
    });

    return persistData;
  } catch (error) {
    console.error('Redux persist debug failed:', error);
    return null;
  }
};

// Comprehensive auth state debug
export const debugAuthState = () => {
  try {
    const token = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);
    const persistKey = 'persist:user';
    const persistData = localStorage.getItem(persistKey);

    console.log('Comprehensive Auth Debug:', {
      hasToken: !!token,
      tokenLocation: token ? (sessionStorage.getItem(GREENFI_STORAGE_KEY) ? 'sessionStorage' : 'localStorage') : 'none',
      hasPersistData: !!persistData,
      persistData: persistData ? JSON.parse(persistData) : null,
      allLocalStorageKeys: Object.keys(localStorage),
      allSessionStorageKeys: Object.keys(sessionStorage),
      timestamp: new Date().toISOString()
    });

    return {
      hasToken: !!token,
      hasPersistData: !!persistData,
      token,
      persistData: persistData ? JSON.parse(persistData) : null
    };
  } catch (error) {
    console.error('Auth state debug failed:', error);
    return null;
  }
};

const trimString = (string: any) => {
  if (typeof string === 'string') {
    // Remove whitespace at the beginning and end of the string:
    let newValue = string.trim();
    // Remove duplicated whitespace between of charaters:
    newValue = newValue.replace(/\s+/g, ' ');
    return newValue;
  } else {
    throw new Error('Passed argument must be a string!');
  }
};

const trimObjectValue = (object: any) => {
  if (typeof object === 'object' && !Array.isArray(object)) {
    const result = { ...object };
    Object.entries(result).forEach(([key, value]) => {
      if (typeof value === 'string') {
        result[key] = trimString(value);
      }
    });
    return result;
  } else {
    throw new Error('Passed argument must be an object!');
  }
};

/**
 * This function is used for trim all the field's value and trigger the validation,
 * using the trigger function form react-hook-form:
 * @param {*} getValues: Get all the values of form
 * @param {*} setValue: Set value for a field inside form
 * @param {*} trigger: trigger validation for every field in form
 * @param {*} onSuccess: Callback will be invoked if form is valid
 * All above params are required and got from returned value of useForm (import from react-hook-form)
 */
const triggerValidation = async (getValues: any, setValue: any, trigger: any, onSuccess: any) => {
  if (!getValues || !setValue || !trigger || !onSuccess) {
    throw new Error('This function requires 4 arguments');
  }
  const formValues = getValues();
  const trimmedValues = trimObjectValue(formValues);
  // Update form's values with trimmed values before trigger validation:
  Object.entries(trimmedValues).forEach(([key, value]) => {
    if (value === '') setValue(key, '');
  });
  const result = await trigger();
  if (result) onSuccess(trimmedValues);
};

const formatDate = (dateString: any) => {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const date = new Date(dateString);
  /* @ts-ignore */
  return date.toLocaleDateString(undefined, options);
};

const formatArrayParam = (array: any) => {
  return array.length > 0 ? `[${array.join(',')}]` : '';
};

function s2ab(s: any) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

const organizeQuestions = (questions: Question[]): Question[] => {
  const orderQuestions: Question[] = [];
  const subQuestionMap = new Map<number, Question[]>();

  // First, group all subquestions by their parent_id
  questions.forEach(question => {
    if (question.parentId) {
      if (!subQuestionMap.has(question.parentId)) {
        subQuestionMap.set(question.parentId, []);
      }
      subQuestionMap.get(question.parentId)?.push(question);
    }
  });

  // Parse content and extract answer if exists
  const processQuestion = (question: Question): Question => {
    // Clone the question to avoid mutating the original
    const processedQuestion = { ...question };

    // Check if content exists and parse it if it's a string
    if (processedQuestion.content) {
      try {
        // Only try to parse if it's a string and looks like JSON
        const contentIsString = typeof processedQuestion.content === 'string';
        if (contentIsString && processedQuestion.content.trim().startsWith('{')) {
          const contentObj = JSON.parse(processedQuestion.content);

          // Extract answer attribute if it exists
          if (contentObj.answer !== undefined) {
            processedQuestion.answer = contentObj.answer;
            // Create a new content object without the answer
            const { answer: _, ...restContent } = contentObj;
            processedQuestion.content = JSON.stringify(restContent);
          }
        }
      } catch (error) {
        // If parsing fails, leave content as is
        console.warn('Failed to parse question content as JSON:', error);
      }
    }

    return processedQuestion;
  };
  // Recursive function to process questions at any nesting level
  const processQuestionWithChildren = (question: Question, baseNumber: string, depth: number = 0): void => {
    // Process and add the current question
    const processedQuestion = processQuestion(question);
    orderQuestions.push({
      ...processedQuestion,
      displayNo: baseNumber
    });

    // Process children if they exist
    const children = subQuestionMap.get(question.id) || [];
    children.forEach((child, index) => {
      let childDisplayNo: string;
      if (depth === 0) {
        // First level subquestions use letters (1a, 1b, etc.)
        childDisplayNo = `${baseNumber}(${String.fromCharCode(97 + index)})`;
      } else {
        // Deeper levels use roman numerals or numbers (1a.i, 1a.ii or 1a.1, 1a.2)
        childDisplayNo = `${baseNumber}.${index + 1}`;
      }

      processQuestionWithChildren(child, childDisplayNo, depth + 1);
    });
  };

  // Process root level questions
  questions
    .filter(question => !question.parentId)
    .forEach((question, index) => {
      processQuestionWithChildren(question, (index + 1).toString());
    });
  return orderQuestions;
};

// interface Question {
//   id: number;
//   parentId: number;
//   displayNo: string;
// }

const groupQuestionsByParentId = (questions: Question[]): Map<number | null, Question[]> => {
  const questionMap = new Map<number | null, Question[]>();
  questions.forEach(question => {
    if (!questionMap.has(question.parentId)) {
      questionMap.set(question.parentId, []);
    }
    questionMap.get(question.parentId)?.push(question);
  });

  return questionMap;
};

const orderQuestions = (questions: Question[]): Question[] => {
  const questionMap = groupQuestionsByParentId(questions);
  const orderedQuestions: Question[] = [];

  const processQuestion = (question: Question, parentIndex: string, childIndex?: number) => {
    const displayNo = childIndex !== undefined ? `${parentIndex}.${childIndex + 1}` : parentIndex;

    orderedQuestions.push({ ...question, displayNo });

    if (questionMap.get(question.id)) {
      questionMap.get(question.id)?.forEach((subQuestion, index) => processQuestion(subQuestion, displayNo, index));
    }
  };

  const rootQuestions = questionMap.get(null) || [];
  rootQuestions.forEach((rootQuestion, index) => {
    processQuestion(rootQuestion, `${index + 1}`);
  });

  return orderedQuestions;
};

export {
  orderQuestions,
  replaceString,
  formatDate,
  getAccessToken,
  formatFileUrlWithToken,
  getNotificationKey,
  setNotificationKey,
  trimString,
  formatArrayParam,
  trimObjectValue,
  triggerValidation,
  s2ab,
  organizeQuestions,
  getStatusColor
};
