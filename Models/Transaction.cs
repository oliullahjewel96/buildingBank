using System.ComponentModel.DataAnnotations;

public enum TransactionType { Deposit, Withdrawal, Transfer }

public class Transaction
{
    [Key]
    public int TransactionId { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Required]
    public TransactionType Type { get; set; }

    [Required]
    public decimal Amount { get; set; }

    // Post-transaction balance snapshot (for audit)
    public decimal BalanceAfter { get; set; }

    // Foreign keys
    public int AccountId { get; set; }
    public Account Account { get; set; }

    // Optional comment
    public string Description { get; set; }
}

