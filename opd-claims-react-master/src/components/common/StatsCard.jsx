/**
 * Stats Card Component
 * Displays a statistic with icon, label, and value
 * @param {Object} props
 * @param {string} props.label - Card label/title
 * @param {number|string} props.value - Statistic value
 * @param {React.ReactNode} props.icon - Icon element
 * @param {string} props.iconColor - Icon color (Tailwind class)
 * @param {function} props.onClick - Optional click handler for navigation
 */
const StatsCard = ({ label, value, icon, iconColor, onClick }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <span className={`${iconColor || 'text-gray-400'}`}>{icon}</span>
            <span className="font-medium">{label}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
