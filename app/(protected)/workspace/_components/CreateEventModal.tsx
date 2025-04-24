import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function CreateEventModal({ projectId,open, onClose }) {
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [frequency, setFrequency] = useState('');
  const [interval, setInterval] = useState('');
  const [count, setCount] = useState('');
  const [until, setUntil] = useState('');
  const [byDay, setByDay] = useState([]);
  const [rdate, setRdate] = useState('');
  const [exdate, setExdate] = useState('');
  const [attendees, setAttendees] = useState(['']);

  const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const handleCreateEvent = async() => {
    try{
      const event = {
        summary,
        location,
        description,
        start: isAllDay ? { date: format(start, 'yyyy-MM-dd') } : { dateTime: start.toISOString(),timeZone:'UTC' },
        end: isAllDay ? { date: format(end, 'yyyy-MM-dd') } : { dateTime: end.toISOString(),timeZone:'UTC' },
        attendees: attendees.filter(email => email).map(email => ({ email })),
      } as {
        summary: string;
        location: string;
        description: string;
        start: any;
        end: any;
        attendees: { email: string }[];
        recurrence?: string[];
      };
  
      if (isRecurring) {
        const recurrence = [];
        if (rdate) {
          const rdateFormatted = rdate
            .split(',')
            .map(d => d.trim().replaceAll('-', ''))
            .join(',');
        
          recurrence.push(`RDATE;VALUE=DATE:${rdateFormatted}`);
        }
        
        if (exdate) {
          const exdateFormatted = exdate
            .split(',')
            .map(d => d.trim().replaceAll('-', ''))
            .join(',');
        
          recurrence.push(`EXDATE;VALUE=DATE:${exdateFormatted}`);
        }
        
        let rrule = "RRULE:"
        if(frequency !== ""){
          rrule += `FREQ=${frequency.toUpperCase()};`
        }
        if (interval) rrule += `INTERVAL=${interval};`
        if (count) rrule += `COUNT=${count};`;
        else if (until) rrule += `UNTIL=${until.replaceAll('-', '')};`;
        if (byDay.length) rrule += `BYDAY=${byDay.join(',')};`
        let newRrule;
        if(rrule[rrule.length-1] === ";"){
          newRrule = rrule.slice(0, -1); // Remove the last semicolon
        }
        recurrence.push(newRrule);
        event.recurrence = recurrence;
      }
      const response = await fetch(`/api/projects/${projectId}/calendar`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({event})
      })
      onClose();
    }catch(error) {
      console.log(error)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <DialogHeader>
          <DialogTitle>Create Google Calendar Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Summary*" value={summary} onChange={(e) => setSummary(e.target.value)} required />
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Textarea placeholder="Description*" value={description} onChange={(e) => setDescription(e.target.value)} required />

          <div className="flex items-center gap-2">
            <Label>All Day Event</Label>
            <Switch checked={isAllDay} onCheckedChange={setIsAllDay} />
          </div>

          <div className="flex gap-4">
            <div>
              <Label>Start {isAllDay ? 'Date' : 'DateTime'}</Label>
              <Input type={isAllDay ? 'date' : 'datetime-local'} onChange={(e) => setStart(new Date(e.target.value))} />
            </div>
            <div>
              <Label>End {isAllDay ? 'Date' : 'DateTime'}</Label>
              <Input type={isAllDay ? 'date' : 'datetime-local'} onChange={(e) => setEnd(new Date(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label>Recurring Event</Label>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} defaultValue="">
                <option value="">Frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>

              {frequency != "" && (
                <Input type="number" placeholder="Interval" onChange={(e) => setInterval(e.target.value)} />
              )}
              <Input type="number" placeholder="Count" onChange={(e) => setCount(e.target.value)} disabled={!!until} />
              <Input type="date" placeholder="Until" onChange={(e) => setUntil(e.target.value)} disabled={!!count} />

              <div>
                <Label>By Day</Label>
                <div className="flex gap-2">
                  {weekdays.map(day => (
                    <label key={day} className="flex items-center gap-1">
                      <input type="checkbox" value={day} onChange={(e) => {
                        setByDay(prev => e.target.checked ? [...prev, day] : prev.filter(d => d !== day));
                      }} /> {day}
                    </label>
                  ))}
                </div>
              </div>

              <Input type="text" placeholder="RDATE" onChange={(e) => setRdate(e.target.value)} />
              <Input type="text" placeholder="EXDATE" onChange={(e) => setExdate(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Attendees</Label>
            {attendees.map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={email}
                  onChange={(e) => {
                    const newAttendees = [...attendees];
                    newAttendees[index] = e.target.value;
                    setAttendees(newAttendees);
                  }}
                  placeholder="Attendee email"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => {
                    setAttendees(attendees.filter((_, i) => i !== index));  // Remove attendee at index
                  }}
                >
                  <span className="text-xl">×</span>  {/* The "X" symbol */}
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setAttendees([...attendees, ''])}>
                Add Attendee
              </Button>
              <Button type="button" variant="outline" onClick={() => setAttendees([''])}>
                Cancel
              </Button>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button onClick={handleCreateEvent}>Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
