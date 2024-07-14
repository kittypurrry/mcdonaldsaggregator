import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Navigate } from "react-router-dom";
import { ReactElement, ReactNode } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode | ReactElement }) => {

  const {user} = useDynamicContext();

  if (!user) {
    return <Navigate to={'/'} replace />;
  }
  
  return children
};

export const CompanyProtectedRoute = ({ children }: { children: ReactNode | ReactElement }) => {

  const {user} = useDynamicContext();

  // @ts-ignore
  if (!user || user?.metadata?.userType !== 'company') {
    return <Navigate to={'/'} replace />;
  }
  
  return children
};
