// src/components/OnboardingTour.js
import React, { useEffect, useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const OnboardingTour = ({ runTour, onFinish }) => {
  const [run, setRun] = useState(runTour);

  const handleCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true'); // ✅ mark as completed
      if (onFinish) onFinish();
    }
  };

  const steps = [
    { target: '#dashboard-link', content: 'This is your Dashboard — view your financial overview.', placement: 'right' },
    { target: '#add-record-link', content: 'Add your expenses and income records here.', placement: 'right' },
    { target: '#scheduling-link', content: 'Schedule future bills or payments.', placement: 'right' },
    { target: '#statistics-link', content: 'See analytics and financial reports.', placement: 'right' },
    { target: '#shared-wallets-link', content: 'Manage shared wallets with others.', placement: 'right' },
    { target: '#budget-link', content: 'Set and track your monthly budgets.', placement: 'right' },
    { target: '#goals-link', content: 'Track your financial goals progress.', placement: 'right' },
    { target: '#profile-link', content: 'Click here to view and edit your profile.', placement: 'bottom' },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#4B6EF5',
          zIndex: 10000,
        },
      }}
    />
  );
};

export default OnboardingTour;
