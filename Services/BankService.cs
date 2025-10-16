using Microsoft.EntityFrameworkCore;

public interface IBankService
{
    // Account Management
    Task<Account> CreateAccountAsync(Account a);
    Task<Account> GetByNumberAsync(string accountNumber);
    Task<IEnumerable<Account>> GetAllAccountsAsync();
    Task<Account> UpdateAccountAsync(string accountNumber, Account updatedAccount);
    Task<bool> DeleteAccountAsync(string accountNumber);

    // Transaction Management
    Task DepositAsync(string accountNumber, decimal amount, string description = null);
    Task WithdrawAsync(string accountNumber, decimal amount, string description = null);
    Task<IEnumerable<Transaction>> GetTransactionsAsync(string accountNumber, int take = 100);
}


public class BankService : IBankService
{
    private readonly BankDbContext _db;
    public BankService(BankDbContext db) { _db = db; }

    public async Task<Account> CreateAccountAsync(Account a)
    {
        _db.Accounts.Add(a);
        await _db.SaveChangesAsync();
        return a;
    }

    public Task<Account> GetByNumberAsync(string accountNumber)
        => _db.Accounts.Include(a => a.Transactions).Include(a => a.Owner)
                       .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

    public async Task DepositAsync(string accountNumber, decimal amount, string description = null)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be > 0");
        using var tx = await _db.Database.BeginTransactionAsync();
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);
        if (account == null) throw new KeyNotFoundException("Account not found");

        account.Balance += amount;
        var trans = new Transaction
        {
            AccountId = account.AccountId,
            Amount = amount,
            Type = TransactionType.Deposit,
            BalanceAfter = account.Balance,
            Description = description
        };
        _db.Transactions.Add(trans);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
    }

    public async Task WithdrawAsync(string accountNumber, decimal amount, string description = null)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be > 0");
        using var tx = await _db.Database.BeginTransactionAsync();
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);
        if (account == null) throw new KeyNotFoundException("Account not found");

        if (account.Balance < amount) throw new InvalidOperationException("Insufficient funds");

        account.Balance -= amount;
        var trans = new Transaction
        {
            AccountId = account.AccountId,
            Amount = amount,
            Type = TransactionType.Withdrawal,
            BalanceAfter = account.Balance,
            Description = description
        };
        _db.Transactions.Add(trans);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsAsync(string accountNumber, int take = 100)
    {
        var acc = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);
        if (acc == null) throw new KeyNotFoundException("Account not found");
        return await _db.Transactions.Where(t => t.AccountId == acc.AccountId)
                                     .OrderByDescending(t => t.Timestamp)
                                     .Take(take).ToListAsync();
    }

    public async Task<IEnumerable<Account>> GetAllAccountsAsync()
    {
        return await _db.Accounts
            .Include(a => a.Owner)
            .Include(a => a.Transactions)
            .ToListAsync();
    }

    public async Task<Account> UpdateAccountAsync(string accountNumber, Account updatedAccount)
    {
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);
        if (account == null)
            throw new KeyNotFoundException("Account not found.");

        // Only update mutable fields (don’t allow overwriting balance manually unless necessary)
        account.AccountType = updatedAccount.AccountType ?? account.AccountType;

        // Allow manual balance change if needed (though normally deposits/withdrawals handle this)
        if (updatedAccount.Balance != default(decimal))
            account.Balance = updatedAccount.Balance;

        await _db.SaveChangesAsync();
        return account;
    }

    public async Task<bool> DeleteAccountAsync(string accountNumber)
    {
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);
        if (account == null)
            return false;

        _db.Accounts.Remove(account);
        await _db.SaveChangesAsync();
        return true;
    }
}
