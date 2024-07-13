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