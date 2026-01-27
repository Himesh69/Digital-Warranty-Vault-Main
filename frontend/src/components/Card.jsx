import React from 'react';
import { cn } from "../utils/utils";

export default function Card({ className, children, ...props }) {
    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200", className)} {...props}>
            {children}
        </div>
    );
}
