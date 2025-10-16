using Bogus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public interface IDbSeeder { Task Seed(); }

public class DbSeeder : IDbSeeder
{
    private readonly BankDbContext _db;
    private readonly IPasswordHasher<UserProfile> _hasher;

    public DbSeeder(BankDbContext db, IPasswordHasher<UserProfile> hasher)
    {
        _db = db; _hasher = hasher;
    }

    public async Task Seed()
    {
        await _db.Database.MigrateAsync();

        if (_db.UserProfiles.Any()) return; // already seeded

        var userFaker = new Faker<UserProfile>()
            .RuleFor(u => u.Username, f => f.Internet.UserName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.Address, f => f.Address.FullAddress())
            .RuleFor(u => u.Phone, f => f.Phone.PhoneNumber())
            .RuleFor(u => u.PictureUrl, f => f.Internet.Avatar());

        var users = userFaker.Generate(40);
        foreach (var u in users)
        {
            u.PasswordHash = _hasher.HashPassword(u, "Password123!"); // default, change if required
            _db.UserProfiles.Add(u);
        }
        await _db.SaveChangesAsync();

        // create accounts
        var rnd = new Random();
        var accountList = new List<Account>();
        foreach (var user in users)
        {
            int numAcc = rnd.Next(1, 4);
            for (int i = 0; i < numAcc; i++)
            {
                var acc = new Account
                {
                    AccountNumber = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 12),
                    Balance = Math.Round((decimal)rnd.NextDouble() * 10000m, 2),
                    AccountType = rnd.Next(0, 2) == 0 ? "Checking" : "Savings",
                    OwnerId = user.Id
                };
                accountList.Add(acc);
                _db.Accounts.Add(acc);
            }
        }
        await _db.SaveChangesAsync();

        // transactions
        var allAccounts = _db.Accounts.ToList();
        foreach (var acc in allAccounts)
        {
            // create some transactions
            int txCount = rnd.Next(5, 20);
            for (int t = 0; t < txCount; t++)
            {
                var isDeposit = rnd.NextDouble() > 0.4;
                var amt = Math.Round((decimal)rnd.NextDouble() * 2000m, 2);
                if (isDeposit)
                {
                    acc.Balance += amt;
                    _db.Transactions.Add(new Transaction
                    {
                        AccountId = acc.AccountId,
                        Amount = amt,
                        Type = TransactionType.Deposit,
                        BalanceAfter = acc.Balance,
                        Timestamp = DateTime.UtcNow.AddDays(-rnd.Next(0, 200))
                    });
                }
                else
                {
                    if (acc.Balance < amt) continue;
                    acc.Balance -= amt;
                    _db.Transactions.Add(new Transaction
                    {
                        AccountId = acc.AccountId,
                        Amount = amt,
                        Type = TransactionType.Withdrawal,
                        BalanceAfter = acc.Balance,
                        Timestamp = DateTime.UtcNow.AddDays(-rnd.Next(0, 200))
                    });
                }
            }
        }
        await _db.SaveChangesAsync();
    }
}

