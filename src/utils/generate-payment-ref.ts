export const generatePaymentRef = () => {
    return (new Date()).getTime().toString();
}