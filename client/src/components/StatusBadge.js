import { STATUS_COLORS } from '../utils/constants';

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
        STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-400'
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
