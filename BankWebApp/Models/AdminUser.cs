namespace BankWebApp.Models
{
    public class AdminUser
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Status { get; set; }

        public AdminUser() { }

        public AdminUser(int id, string name, string email, string status)
        {
            Id = id;
            Name = name;
            Email = email;
            Status = status;
        }

    }
}
