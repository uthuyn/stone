/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Stack } from '@keystone-ui/core';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { useTranslation } from 'react-i18next';

import { SignoutButton } from '../../../../admin-ui/components/SignoutButton';
import { ErrorContainer } from '../../../../admin-ui/components/Errors';

type NoAccessPage = { sessionsEnabled: boolean };

export const getNoAccessPage = (props: NoAccessPage) => () => <NoAccessPage {...props} />;

export const NoAccessPage = ({ sessionsEnabled }: NoAccessPage) => {
  const { t } = useTranslation();

  return (
    <ErrorContainer>
      <Stack align="center" gap="medium">
        <AlertTriangleIcon size="large" />
        <div>{t("You don't have access to this page")}.</div>
        {sessionsEnabled ? <SignoutButton /> : null}
      </Stack>
    </ErrorContainer>
  );
};
