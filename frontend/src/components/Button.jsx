import React from 'react';
import { cn } from "../utils/utils";
import { Loader2 } from "lucide-react";

export default function Button({ className, variant = "primary", size = "default", isLoading, children, ...props }) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                {
                    "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow": variant === "primary",
                    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400": variant === "outline",
                    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500": variant === "destructive",
                    "bg-transparent text-gray-700 hover:bg-gray-100": variant === "ghost",
                    "h-10 px-4 py-2": size === "default",
                    "h-8 px-3 text-sm": size === "sm",
                    "h-12 px-6 text-lg": size === "lg",
                },
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
