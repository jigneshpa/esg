import React from 'react';
import { useParams } from 'react-router-dom';

import SurveyList from '.';

const SurveyWrapper = () => {
  const { userQuestionnaireId } = useParams();

  return <SurveyList key={userQuestionnaireId} />;
};

export default SurveyWrapper;
