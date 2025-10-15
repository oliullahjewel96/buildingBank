using System;

namespace BankWebApp.Models
{
    public class BankTransaction
    {
        public string Reference { get; set; }
        public string User { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }

        public BankTransaction() { }

        public BankTransaction(string reference, string user, decimal amount, DateTime date)
        {
            Reference = reference;
            User = user;
            Amount = amount;
            Date = date;
        }
    }
}
