export const isTodayDate = (date) => {
   return new Date(date).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0);                
}