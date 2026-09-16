## Persistence
I added a few books, stopped the server completely, restarted it, and reloaded the page. The books were all still there — proof they're saved in `bookstore.db` on disk, not held in memory.

## Query-String Filter
`GET /books?genre=...` (or `?author=...`) filters using SQL (`WHERE genre = ?`) so only matching rows come back from the database, instead of fetching everything and filtering in the browser.
