using System.ComponentModel.DataAnnotations;
using System.Transactions;
public class Account
{
    [Key]
    public int AccountId { get; set; }

    [Required, MaxLength(30)]
    public string AccountNumber { get; set; } // unique

    [Required]
    public decimal Balance { get; set; } = 0m;

    [Required]
    public string AccountType { get; set; } // e.g., "Checking", "Savings"

    // Foreign key to UserProfile
    public int OwnerId { get; set; }
    public UserProfile Owner { get; set; }

    public ICollection<Transaction> Transactions { get; set; }
}
