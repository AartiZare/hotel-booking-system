Hotel Booking System (Backend API)

This is a headless backend API built using Node.js, Express, and MongoDB for a hotel booking system.
It supports hotel management, dynamic pricing, and location-based hotel search.

Setup Instructions
git clone: https://github.com/AartiZare/hotel-booking-system.git
cd hotel-booking-system
npm install
npm run dev

Assumptions:-

Hotel end date is inclusive
Special price overrides default price for matching dates
Hotels are soft-deleted using isActive
Search radius is fixed
Pricing is calculated per night

Sample API Usage:-
Search Hotels
GET /hotels/search?latitude=15.5&longitude=73.7&startDate=2026-12-24&endDate=2026-12-26

Create Hotel (Admin):-
POST /hotels
Authorization: Bearer <token>
FormData:
name, city, latitude, longitude, defaultPrice, photos[]

Notes:-
JWT used for authentication
Admin-only access for hotel management
APIs tested using Postman

Postman collection is included in the repository
