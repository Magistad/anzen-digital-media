package com.anzendigitalmedia.closepath.calendar;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.provider.CalendarContract;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Calendar;
import java.util.TimeZone;

@CapacitorPlugin(name = "ClosepathCalendar")
public class ClosepathCalendarPlugin extends Plugin {

    @PluginMethod
    public void addEvent(PluginCall call) {
        Calendar start = parseDate(call.getString("date"));
        if (start == null) {
            call.reject("A date is required");
            return;
        }
        Calendar end = (Calendar) start.clone();
        end.add(Calendar.DATE, 1);
        Intent intent = new Intent(Intent.ACTION_INSERT)
            .setData(CalendarContract.Events.CONTENT_URI)
            .putExtra(CalendarContract.Events.TITLE, call.getString("title", "Closepath"))
            .putExtra(CalendarContract.Events.DESCRIPTION, call.getString("description", ""))
            .putExtra(CalendarContract.Events.EVENT_LOCATION, call.getString("location", ""))
            .putExtra(CalendarContract.EXTRA_EVENT_ALL_DAY, true)
            .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, start.getTimeInMillis())
            .putExtra(CalendarContract.EXTRA_EVENT_END_TIME, end.getTimeInMillis());
        try {
            startActivityForResult(call, intent, "calendarResult");
        } catch (ActivityNotFoundException exception) {
            call.reject("No calendar app is available");
        }
    }

    @ActivityCallback
    private void calendarResult(PluginCall call, ActivityResult result) {
        JSObject opened = new JSObject();
        opened.put("opened", true);
        call.resolve(opened);
    }

    private Calendar parseDate(String iso) {
        if (iso == null || !iso.matches("\\d{4}-\\d{2}-\\d{2}")) return null;
        String[] parts = iso.split("-");
        int year = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);
        int day = Integer.parseInt(parts[2]);
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        calendar.setLenient(false);
        calendar.set(Calendar.YEAR, year);
        calendar.set(Calendar.MONTH, month - 1);
        calendar.set(Calendar.DAY_OF_MONTH, day);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        try {
            calendar.getTimeInMillis();
            return calendar;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
