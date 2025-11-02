/**
 * Patient Details Component
 * Displays patient information in a card layout
 */
const PatientDetails = ({ patient }) => {
  return (
    <div className="bg-white text-black rounded-lg border border-gray-200 p-5">
      <h3 className="text-base font-semibold mb-4">Patient Details</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            PATIENT NAME
          </label>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{patient?.name}</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
           PRINCIPLE BENEFICIARY
          </label>
          <p className="text-sm font-medium">{patient?.beneficiaryName}</p>
        </div>
          <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            VISIT NUMBER
          </label>
          <p className="text-sm font-medium">{patient?.visitNumber}</p>
        </div>

        {/*  New dynamic field */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            BENEFICIARY PATIENT RELATION
          </label>
          <p className="text-sm font-medium">{patient?.relation}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            CLAIM NUMBER
          </label>
          <p className="text-sm font-medium">{patient?.claimNumber}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            CLAIM CREATED
          </label>
          <p className="text-sm font-medium">{patient?.claimCreated}</p>
        </div>
      </div>
    </div>
  )
}

export default PatientDetails
