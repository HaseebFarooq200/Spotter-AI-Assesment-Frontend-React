import DriversDailyLog  from "./DriversDailyLogs";
export default function EldLogSheet({ log, key }) {
    return (
    <div className="min-h-screen bg-white">
        <DriversDailyLog events={log} />
    </div>
);}
