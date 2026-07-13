import React from 'react';
import { motion } from 'motion/react';
import { Inbox, Search, FileText, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'inbox' | 'search' | 'file' | 'alert' | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action
}) => {
  const icons = {
    inbox: <Inbox className="w-16 h-16 text-gray-400" />,
    search: <Search className="w-16 h-16 text-gray-400" />,
    file: <FileText className="w-16 h-16 text-gray-400" />,
    alert: <AlertCircle className="w-16 h-16 text-gray-400" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="mb-4">
        {typeof icon === 'string' ? icons[icon] : icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
