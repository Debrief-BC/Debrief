# Debrief API
Blockchain Communication

## Communication API
The Debrief platform is designed as a high-availability REST API available either with traditional HTTP request/responses, or through a persistent Socket connection through the sails. io client.  In addition to reducing connection overhead, socket connections can also receive events for things like chat messages, members changing their name, status, or avatar. Any real-time application can benefit from the flexibility of using either long-polling or socket connections wherever is needed.
[Communication API Doucmentation](Docs/Debrief_Commuication_API.md)

## Management API
The Debrief Management API powers the Developer Portal, and allows developers to register and manage applications that use the Debrief Communication API. The Management API is a good choice for programatically managing apps, but for a more user-friendly interface to simply manage developers and applications, the Developer Portal is recommended. [Management API Documentation](Docs/Debrief_Management_API.md)
