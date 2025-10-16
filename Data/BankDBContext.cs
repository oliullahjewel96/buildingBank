using Microsoft.EntityFrameworkCore;

public class BankDbContext : DbContext
{
    public BankDbContext(DbContextOptions<BankDbContext> options) : base(options) { }

    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProfile>()
            .HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<UserProfile>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Account>()
            .HasIndex(a => a.AccountNumber).IsUnique();

        modelBuilder.Entity<UserProfile>()
            .HasMany(u => u.Accounts)
            .WithOne(a => a.Owner)
            .HasForeignKey(a => a.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Account>()
            .HasMany(a => a.Transactions)
            .WithOne(t => t.Account)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

