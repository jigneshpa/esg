import { Text, Input, Select, RadioGroup, Radio, Box, CheckboxGroup, Checkbox } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormTableBuilder } from '@/components/DynamicTableBuilder';

const handleAnswerChange = (newAnswer: string) => {
  console.log('Answer changed to:', newAnswer);
};

export default function ListItemAnswer({answer, status, answerType, onAnswerChange, questionContent}: {answer: any, status: "approved" | "rejected" | "pendingSubmission" | "pendingReview", answerType: 'textBox' | 'dropDown' | 'checkbox' | 'table' | 'radio', onAnswerChange: (newAnswer: string) => void, questionContent: any}) {
  if(status === "approved") {
    return <AnswerTypeHandler disableAnswerChange={true} status={status} answer={answer} answerType={answerType} onAnswerChange={onAnswerChange} questionContent={questionContent} />
  } else if(status === "rejected") {
    return <AnswerTypeHandler status={status} answer={answer} answerType={answerType} onAnswerChange={onAnswerChange} questionContent={questionContent} />
  } else if(status === "pendingSubmission") {
    return <AnswerTypeHandler status={status} answer={answer} answerType={answerType} onAnswerChange={onAnswerChange} questionContent={questionContent} />
  } else if(status === "pendingReview") {
    return <AnswerTypeHandler disableAnswerChange={true} status={status} answer={answer} answerType={answerType} onAnswerChange={onAnswerChange} questionContent={questionContent} />
  } else {
    return <Input placeholder="Enter answer" value={answer} onChange={(e) => onAnswerChange(e.target.value)} />;
  }
}

function AnswerTypeHandler({answer, answerType, onAnswerChange, status, questionContent, disableAnswerChange}: {answer: any, answerType: 'textBox' | 'dropDown' | 'checkbox' | 'table' | 'radio', onAnswerChange: (newAnswer: any) => void, status: "approved" | "rejected" | "pendingSubmission" | "pendingReview", questionContent: any, disableAnswerChange?: boolean}) {
  const methods = useForm({
    defaultValues: {
      tableOptions: (status === "pendingSubmission" || status === "rejected") ? questionContent.tableOptions : answer
    }
  });
  if(answerType === "textBox") {
    if (disableAnswerChange) {
      return <Text><b>A.</b> {answer}</Text>
    }
    return <Input placeholder="Enter answer" value={status === 'rejected' || status === 'pendingSubmission' ? answer : ''}  onChange={(e) => onAnswerChange(e.target.value)} />;
  } else if(answerType === "dropDown") {
    return (
      <Box width={"20%"} display="flex" flexDirection="column" gap={2}>
        <Select disabled={disableAnswerChange} placeholder="Select option" value={answer} onChange={(e) => onAnswerChange(e.target.value)}>
          {questionContent?.dropDownOptions?.map((option: any) => (
            <option key={option.id} value={option.id}>{option.text}</option>
          ))}
        </Select>
      </Box>
    );
  } else if(answerType === "checkbox") {
    const options = questionContent?.checkboxOptions || [];
    return  <Box display="flex" flexDirection="column" gap={2}>
      <CheckboxGroup >
      {(Array.isArray(answer) && answer.length > 0 ? answer : options).map((option: any) => (
        <Checkbox
          disabled={disableAnswerChange}
          key={option.id}
          value={option.id}
          isChecked={option?.isChecked}
          onChange={(e) => {
            if (disableAnswerChange) return;
            onAnswerChange((Array.isArray(answer) && answer.length > 0 ? answer : options).map((opt: any) =>
              opt.text === option.text ? { ...opt, isChecked: e.target.checked } : opt
            ));
          }}
        >
          {option?.text || ''}
        </Checkbox>
      ))}
    </CheckboxGroup>
    </Box>;
  } else if(answerType === "table") {
    return (
      <FormProvider {...methods}>
        <FormTableBuilder
          name="tableOptions"
          onTableStructureChange={onAnswerChange}
          hideConfiguration={true}
          allowEmptyCellEditing={status === "pendingSubmission" || status === "rejected"}
        />
      </FormProvider>
    );
  } else if(answerType === "radio") {
    const radioOptions = questionContent?.radioOptions || [];
    const selectedAnswer = ((Array.isArray(answer) && answer.length > 0) ? answer : radioOptions).find((item: any) => item.isChecked)?.text;
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <RadioGroup style={{display: 'flex', flexDirection: 'column', gap: 10}} onChange={(selectedValue) => {
          const finalValue = JSON.parse(JSON.stringify(Array.isArray(answer) && answer.length > 0 ? answer : radioOptions))
          finalValue.forEach((item: any) => {
            if (item.text === selectedValue) {
              item.isChecked = true;
            } else {
              item.isChecked = false;
            }
          });
          onAnswerChange(finalValue);
        }} value={selectedAnswer || ''}>
          {(Array.isArray(answer) && answer.length > 0 ? answer : radioOptions)?.map((option: any) => (
            <Radio disabled={disableAnswerChange} 
              key={option.id} value={option.text}>{option.text}</Radio>
          ))}
        </RadioGroup>
      </Box>
    );
  }
  return null;
}