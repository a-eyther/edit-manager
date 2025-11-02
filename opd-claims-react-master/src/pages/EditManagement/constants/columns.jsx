import StatusBadge from '../../../components/common/StatusBadge';
import TimeElapsed from '../components/TimeElapsed';
import { getWorkflowStage } from '../../../utils/claimStatus';
import ClaimActionMenu from '../../../components/common/ClaimActionMenu';

const TIMEZONE_MAP = {
  EAT: 'Africa/Nairobi',
};

const formatDateTimeWithTimezone = (value, timezoneCode) => {
  if (!value) {
    return { date: '-', time: '-' };
  }

  const timezone = TIMEZONE_MAP[timezoneCode];
  const date = new Date(value);

  try {
    const dateOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    if (timezone) {
      dateOptions.timeZone = timezone;
      timeOptions.timeZone = timezone;
    }

    const formattedDate = new Intl.DateTimeFormat('en-GB', dateOptions).format(date);
    const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);

    return {
      date: formattedDate,
      time: formattedTime,
    };
  } catch (error) {
    console.error('Failed to format date with timezone', { value, timezoneCode, error });
    return { date: value, time: timezoneCode || '' };
  }
};

/**
 * Table column definitions for Edit Management
 */
export const editManagementColumns = [
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    render: (_value, row) => <ClaimActionMenu row={row} />,
  },
  {
    key: 'assigned_to_name',
    header: 'Assigned To',
    sortable: true,
    render: (value) => value || <span className="text-gray-400 italic">Unassigned</span>
  },
  {
    key: 'id',
    header: 'Claim ID',
    sortable: true,
  },
  {
    key: 'visit_number',
    header: 'Visit Number',
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Date & Time',
    sortable: true,
    render: (value, row) => {
      if (!value) return '-';
      const { date, time } = formatDateTimeWithTimezone(value, row?.created_at_timezone);
      return (
        <div>
          <div className="font-medium text-gray-900">{date}</div>
          <div className="text-xs text-gray-500">
            {time}
            {row?.created_at_timezone ? ` ${row.created_at_timezone}` : ''}
          </div>
        </div>
      );
    },
  },
  {
    key: 'time_elapsed',
    header: 'Time Elapsed',
    render: (_value, row) => <TimeElapsed createdAt={row.created_at} timeElapsed={row.time_elapsed} />,
  },
  // {
  //   key: 'provider_name',
  //   header: 'Provider',
  //   sortable: true,
  // },
  // {
  //   key: 'benefit_type',
  //   header: 'Benefit Type',
  //   render: (value) => <StatusBadge status={value} />,
  // },
  {
    key: 'benefit_name',
    header: 'Benefit Name',
  },
  // {
  //   key: 'diagnosis',
  //   header: 'Diagnosis',
  // },
  {
    key: 'decision',
    header: 'AI Decision',
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: 'edit_status',
    header: 'Edit Status',
    render: (_value, row) => <StatusBadge status={getWorkflowStage(row)} />,
  },
];
