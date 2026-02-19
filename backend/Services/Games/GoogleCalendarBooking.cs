// using Google.Apis.Auth.OAuth2;
// using Google.Apis.Calendar.v3;
// using Google.Apis.Calendar.v3.Data;
// using Google.Apis.Services;
// using System;
// using System.Collections.Generic;
// using System.IO;
// using System.Threading.Tasks;

// public class GoogleCalendarBooking
// {
//     public static async Task CreateBookingRequest(string calendarId, Event eventDetails, string userEmail)
//     {
//         GoogleCredential credential;
//         using (var stream = new FileStream("client_secret.json", FileMode.Open, FileAccess.Read))
//         {
//             credential = GoogleCredential.FromStream(stream)
//                 .CreateScoped(new[] { CalendarService.Scope.Calendar });
//             // credential = credential.CreateWithUser(userEmail); 
//         }

//         var service = new CalendarService(new BaseClientService.Initializer()
//         {
//             HttpClientInitializer = credential,
//             ApplicationName = "Calendar API Sample",
//         });

//         var attendees = new List<EventAttendee>
//         {
//             new EventAttendee { Email = userEmail }, 
//             new EventAttendee { Email = "guest1@example.com" }
//         };
//         eventDetails.Attendees = attendees;


//         EventsResource.InsertRequest request = service.Events.Insert(eventDetails, calendarId);
//         request.SendUpdates = EventsResource.InsertRequest.SendUpdatesEnum.All; // Sends email invitations to all guests

//         Event createdEvent = await request.ExecuteAsync();
//         Console.WriteLine($"Event created: {createdEvent.HtmlLink}");
//     }
// }
