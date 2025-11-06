'use client'
import { NotificationProvider } from '@/context/useNotificationContext'
import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { ToastContainer } from 'react-toastify'
import { ChildrenType } from '../../types/component-props'
import "react-toastify/dist/ReactToastify.css";
import React from "react";

type ChildrenType = {
  children: React.ReactNode;
};

// 🔹 Loader personnalisé affiché pendant le chargement du LayoutProvider
const PageLoader = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <div className="loader"></div>
      <p className="text-gray-600 mt-4 text-sm">Chargement en cours...</p>

      <style jsx>{`
      .loader {
        border: 4px solid #e5e7eb;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
    </div>
);

// 🔹 Import dynamique du LayoutProvider avec fallback du loader
const LayoutProvider = dynamic(
    () =>
        import("@/context/useLayoutContext").then((mod) => mod.LayoutProvider),
    {
      ssr: false,
      loading: () => <PageLoader />, // Affiché pendant le chargement
    }
);

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
      <SessionProvider>
        <LayoutProvider>
          <NotificationProvider>
            {children}
            <ToastContainer theme="colored" />
          </NotificationProvider>
        </LayoutProvider>
      </SessionProvider>
  );
};

export default AppProvidersWrapper;
