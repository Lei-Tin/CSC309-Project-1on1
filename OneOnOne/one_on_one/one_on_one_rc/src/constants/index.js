export const ACCOUNTS_API_URL = "http://localhost:8000/accounts"
export const CALENDARS_API_URL = "http://localhost:8000/calendars"
export const CONTACTS_API_URL = "http://localhost:8000/contacts"

export const REQUEST_HEADER_CONFIG = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  };