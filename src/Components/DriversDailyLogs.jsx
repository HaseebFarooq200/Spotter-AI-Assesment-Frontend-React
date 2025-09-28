"use client"

const cn = (...classes) => classes.filter(Boolean).join(" ")

// A shared min-width for the 24-hour track so it scrolls on small screens
const TIMELINE_MIN = "min-w-[48rem] md:min-w-0"

const LabeledBox = ({ label, className, children }) => {
  return (
    <div className={cn("relative border border-gray-300 rounded-none", className)}>
      <div className="pointer-events-none absolute -top-2 left-2 bg-white px-1 text-[10px] leading-none text-gray-500">
        {label}
      </div>
      <div className="p-2">{children}</div>
    </div>
  )
}

const SmallInput = ({ className }) => {
  return (
    <input
      aria-label="input"
      className={cn(
        "h-6 w-full border border-gray-300 bg-white px-1 text-[12px] leading-none",
        "placeholder:text-gray-400",
        className,
      )}
      placeholder=""
    />
  )
}

const TinyLine = () => <div className="h-px w-full bg-gray-300" />

const HoursHeader = () => {
  return (
    <div className="relative py-2">
      <div className="grid [grid-template-columns:repeat(24,minmax(0,1fr))] text-[10px] text-gray-600 leading-none">
        {Array.from({ length: 24 }).map((_, i) => {
          const hour = ((i + 11) % 12) + 1
          return (
            <div key={i} className="text-center">
              {hour}
            </div>
          )
        })}
      </div>
      <div className="absolute inset-x-0 top-0 flex justify-between px-2 text-[10px] text-gray-600">
        <span>Mid</span>
        <span>Noon</span>
        <span>Mid</span>
      </div>
    </div>
  )
}

const HourTicks = () => {
  return (
    <div className="relative h-10 overflow-visible">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, #e5e7eb 0 1px, transparent 1px 6px)",
        }}
      />
      <div className="grid h-full [grid-template-columns:repeat(24,minmax(0,1fr))]">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={cn("relative h-full border-l border-gray-300", i === 0 ? "border-l-0" : "")}
          />
        ))}
      </div>
    </div>
  )
}

const TimelineOverlay = ({ events = [] }) => {
  const segments = events.flatMap((ev) => splitMidnight(ev.start, ev.end))
  return (
    <div className="pointer-events-none absolute inset-0">
      {segments.map((seg, i) => {
        const left = (seg.start / 24) * 100
        const width = ((seg.end - seg.start) / 24) * 100
        return (
          <div key={`seg-${i}`}>
            <div
              className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-black"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
            <div className="absolute top-0 bottom-0 w-px bg-black" style={{ left: `${left}%` }} />
            <div
              className="absolute top-0 bottom-0 w-px bg-black"
              style={{ left: `${left + width}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

const normalizeStatus = (raw) => {
  const s = String(raw || "").toLowerCase().replace(/[\s_-]+/g, "")
  if (s.includes("sleeper")) return "sleeper"
  if (s.includes("driving") && !s.includes("not")) return "driving"
  if (s.includes("onduty") && s.includes("notdriving")) return "onduty-notdriving"
  if (s.includes("onduty")) return "onduty-notdriving"
  return "offduty"
}

const clampHour = (n) => Math.min(24, Math.max(0, Number(n)))

const splitMidnight = (start, end) => {
  const s = clampHour(start)
  const e = clampHour(end)
  if (Number.isNaN(s) || Number.isNaN(e)) return []
  if (e >= s) return [{ start: s, end: e }]
  return [
    { start: s, end: 24 },
    { start: 0, end: e },
  ]
}

const getEvents = (input) => {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (Array.isArray(input?.events)) return input.events
  if (typeof input === "object") {
    const vals = Object.values(input).flatMap((v) => (Array.isArray(v) ? v : [v]))
    return vals.filter((v) => v && typeof v === "object" && "start" in v && "end" in v)
  }
  return []
}

const DutyRow = ({ idx, label, events = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
      <div className="flex items-center gap-2 border-b border-gray-300 px-2 py-2 text-[12px] md:border-r">
        <span className="inline-block w-4 text-right">{idx}.</span>
        <span>{label}</span>
      </div>

      {/* Scrollable timeline on small screens */}
      <div className="relative border-b border-gray-300 px-0 py-0 overflow-x-auto hide-scrollbar">
        <div className={cn("relative", TIMELINE_MIN)}>
          <HourTicks />
          <TimelineOverlay events={events} />
        </div>
      </div>
    </div>
  )
}

export function DriversDailyLog({ log, events = [] }) {
  // Prefer explicit events prop if provided; otherwise fall back to log.events or keyed object
  let sourceEvents = getEvents(events)
  if (sourceEvents.length === 0) {
    sourceEvents = getEvents(log)
  }

  const grouped = {
    offduty: [],
    sleeper: [],
    driving: [],
    "onduty-notdriving": [],
  }

  for (const ev of sourceEvents) {
    const k = normalizeStatus(ev.status)
    grouped[k]?.push({
      start: ev.start,
      end: ev.end,
    })
  }

  return (
    <div className="bg-white text-gray-900 mt-4 p-4 shadow-md">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <h1 className="text-[18px] md:text-[22px] font-semibold leading-none">
            Day {events.day ?? ""}
          </h1>
          <div className="text-[10px] leading-tight text-gray-600">
            <div>Original - File at home terminal.</div>
            <div>Duplicate - Driver retains in his/her possession for 8 days.</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:[grid-template-columns:repeat(8,minmax(0,1fr))] gap-2 text-[12px]">
          <div className="md:col-span-2 grid grid-cols-2 items-end gap-2">
            <div className="text-[10px] text-gray-600">24 hours</div>
            <div className="col-span-2 grid grid-cols-3 gap-2">
              <SmallInput />
              <SmallInput />
              <SmallInput />
            </div>
            <div className="col-span-2 grid grid-cols-3 text-[10px] text-gray-600">
              <div>(month)</div>
              <div className="text-center">(day)</div>
              <div className="text-right">(year)</div>
            </div>
          </div>

          <div className="md:col-span-3">
            <LabeledBox label="From:">
              <SmallInput />
            </LabeledBox>
          </div>
          <div className="md:col-span-3">
            <LabeledBox label="To:">
              <SmallInput />
            </LabeledBox>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-2">
            <LabeledBox label="Total Miles Driving Today">
              <SmallInput />
            </LabeledBox>
            <LabeledBox label="Total Mileage Today">
              <SmallInput />
            </LabeledBox>
            <LabeledBox
              label="Truck/Tractor and Trailer Numbers or License Plate(s)/State (show each unit)"
              className="md:col-span-2"
            >
              <SmallInput />
            </LabeledBox>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 gap-2">
            <LabeledBox label="Name of Carrier or Carriers">
              <SmallInput />
            </LabeledBox>
            <LabeledBox label="Main Office Address">
              <SmallInput />
            </LabeledBox>
            <LabeledBox label="Home Terminal Address">
              <SmallInput />
            </LabeledBox>
          </div>
        </div>
      </header>

      <TinyLine />

      {/* Hours ruler */}
      <section className="mt-3 space-y-0.5">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_84px]">
          <div className="border border-gray-300 p-2 text-[12px] md:border-r">
            <div className="text-[10px] text-gray-600">Status</div>
          </div>

          {/* Scrollable hours header on small screens */}
          <div className="border border-t-0 md:border-l-0 md:border-r-0 border-gray-300 px-0 py-1 overflow-x-auto hide-scrollbar">
            <div className={cn("px-2", TIMELINE_MIN)}>
              <HoursHeader />
            </div>
          </div>

          <div className="flex items-end justify-center border border-t-0 border-gray-300 p-2 text-[10px] text-gray-600">
            Total Hours
          </div>
        </div>

        <div className="border-x border-gray-300">
          <DutyRow idx={1} label="Off Duty" events={grouped["offduty"]} />
          <DutyRow idx={2} label="Sleeper Berth" events={grouped["sleeper"]} />
          <DutyRow idx={3} label="Driving" events={grouped["driving"]} />
          <DutyRow
            idx={4}
            label="On Duty (not driving)"
            events={grouped["onduty-notdriving"]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_84px] border border-t-0 border-gray-300 text-[12px]">
          <div className="px-2 py-1 text-[10px] text-gray-600 md:border-r md:border-gray-300">
            Mid - Mid
          </div>
          {/* Scrollable hours header on small screens */}
          <div className="px-0 py-1 overflow-x-auto hide-scrollbar">
            <div className={cn("px-2", TIMELINE_MIN)}>
              <HoursHeader />
            </div>
          </div>
          <div className="flex items-center justify-center px-2 py-1">—</div>
        </div>
      </section>

      {/* Remarks */}
      <section className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8">
          <LabeledBox label="Remarks">
            <textarea
              className="min-h-24 w-full resize-y border border-gray-300 bg-white p-2 text-[12px]"
              placeholder=""
            />
          </LabeledBox>
        </div>

        <div className="md:col-span-4 grid grid-cols-1 gap-3">
          <LabeledBox label="Shipping Documents:">
            <div className="grid gap-2 text-[12px]">
              <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                <span className="text-[11px]">DV. or Manifest No.</span>
                <SmallInput />
              </div>
              <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                <span className="text-[11px]">or</span>
                <div />
              </div>
              <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                <span className="text-[11px]">Shipper &amp; Commodity</span>
                <SmallInput />
              </div>
            </div>
          </LabeledBox>
        </div>
      </section>

      {/* Location/time entry helper line */}
      <section className="mt-2">
        <div className="text-[10px] leading-snug text-gray-600">
          Enter name of place you reported and where released from work and when and where each
          change of duty occurred. Use time standard of home terminal.
        </div>
      </section>

      {/* Recap */}
      <section className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[12px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:col-span-12">
            <LabeledBox label="Recap: Complete at end of day" className="md:col-span-3">
              <div className="space-y-2">
                <div className="text-[11px]">On duty hours today, Totals lines 3 &amp; 4</div>
                <SmallInput />
              </div>
            </LabeledBox>

            <LabeledBox label="70 Hour / 8 Day Drivers" className="md:col-span-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="space-y-1">
                  <div>A. Total hours on duty last 7 days including today.</div>
                  <SmallInput />
                </div>
                <div className="space-y-1">
                  <div>B. Total hours available tomorrow 70- A =</div>
                  <SmallInput />
                </div>
                <div className="space-y-1">
                  <div>C. Total hours on duty last 8 days including today.</div>
                  <SmallInput />
                </div>
                <div className="space-y-1">
                  <div>Drivers A., B., C.</div>
                  <SmallInput />
                </div>
              </div>
            </LabeledBox>

            <LabeledBox label="60 Hour / 7 Day Drivers" className="md:col-span-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="space-y-1">
                  <div>A. Total hours on duty last 6 days including today.</div>
                  <SmallInput />
                </div>
                <div className="space-y-1">
                  <div>B. Total hours available tomorrow 60- A =</div>
                  <SmallInput />
                </div>
                <div className="space-y-1">
                  <div>C. Total hours on duty last 7 days including today.</div>
                  <SmallInput />
                </div>
                <div className="space-y-1">
                  <div>Drivers A., B., C.</div>
                  <SmallInput />
                </div>
              </div>
            </LabeledBox>

            <LabeledBox label="If you took 34 consecutive hours off" className="md:col-span-1">
              <div className="space-y-1 text-[11px]">
                <div>Day you became available</div>
                <SmallInput />
              </div>
            </LabeledBox>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DriversDailyLog