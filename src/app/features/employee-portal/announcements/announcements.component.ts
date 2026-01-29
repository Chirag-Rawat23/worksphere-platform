import { Component } from '@angular/core';

interface Announcement {
  id: string;
  title: string;
  date: string;
  body: string;
}

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent {
  announcements: Announcement[] = [
    {
      id: '1',
      title: 'Updated Leave Policy',
      date: '2025-08-20',
      body: 'The leave policy has been updated. Please submit leave requests at least 7 days in advance.'
    },
    {
      id: '2',
      title: 'Payroll Schedule',
      date: '2025-08-15',
      body: 'Payroll for August will be processed on August 30.'
    },
    {
      id: '3',
      title: 'Team Town Hall',
      date: '2025-08-10',
      body: 'Join the town hall on August 25 at 3:00 PM in the main conference room.'
    }
  ];
}
