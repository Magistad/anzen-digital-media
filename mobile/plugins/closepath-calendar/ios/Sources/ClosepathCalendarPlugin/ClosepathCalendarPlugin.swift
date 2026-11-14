import Capacitor
import EventKit
import EventKitUI

@objc(ClosepathCalendarPlugin)
public class ClosepathCalendarPlugin: CAPPlugin, CAPBridgedPlugin, EKEventEditViewDelegate {
    public let identifier = "ClosepathCalendarPlugin"
    public let jsName = "ClosepathCalendar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "addEvent", returnType: CAPPluginReturnPromise)
    ]

    private let store = EKEventStore()
    private var pending: CAPPluginCall?

    @objc func addEvent(_ call: CAPPluginCall) {
        if pending != nil {
            call.reject("Calendar is already open")
            return
        }
        guard let date = call.getString("date"), let parts = Self.parse(date) else {
            call.reject("A date is required")
            return
        }
        pending = call
        let title = call.getString("title") ?? "Closepath"
        let notes = call.getString("description") ?? ""
        let location = call.getString("location") ?? ""
        let finish: (Bool, Error?) -> Void = { granted, error in
            self.present(
                granted: granted,
                error: error,
                year: parts.year,
                month: parts.month,
                day: parts.day,
                title: title,
                notes: notes,
                location: location
            )
        }
        if #available(iOS 17.0, *) {
            store.requestFullAccessToEvents(completion: finish)
        } else {
            store.requestAccess(to: .event, completion: finish)
        }
    }

    private func present(
        granted: Bool,
        error: Error?,
        year: Int,
        month: Int,
        day: Int,
        title: String,
        notes: String,
        location: String
    ) {
        DispatchQueue.main.async {
            guard granted, error == nil else {
                self.pending?.reject("Calendar access was denied")
                self.pending = nil
                return
            }
            guard let start = Calendar.current.date(from: DateComponents(year: year, month: month, day: day)),
                  let end = Calendar.current.date(byAdding: .day, value: 1, to: start),
                  let presenter = self.bridge?.viewController
            else {
                self.pending?.reject("Couldn’t open the calendar")
                self.pending = nil
                return
            }
            let event = EKEvent(eventStore: self.store)
            event.title = title
            event.notes = notes
            event.location = location
            event.isAllDay = true
            event.startDate = start
            event.endDate = end
            event.calendar = self.store.defaultCalendarForNewEvents
            let controller = EKEventEditViewController()
            controller.eventStore = self.store
            controller.event = event
            controller.editViewDelegate = self
            presenter.present(controller, animated: true)
        }
    }

    public func eventEditViewController(
        _ controller: EKEventEditViewController,
        didCompleteWith action: EKEventEditViewAction
    ) {
        controller.dismiss(animated: true) {
            if action == .canceled {
                self.pending?.reject("Calendar canceled")
            } else {
                self.pending?.resolve(["opened": true])
            }
            self.pending = nil
        }
    }

    private static func parse(_ iso: String) -> (year: Int, month: Int, day: Int)? {
        let parts = iso.split(separator: "-")
        guard parts.count == 3, let year = Int(parts[0]), let month = Int(parts[1]), let day = Int(parts[2]) else {
            return nil
        }
        guard (1...12).contains(month), (1...31).contains(day), year >= 1900 else { return nil }
        return (year, month, day)
    }
}
