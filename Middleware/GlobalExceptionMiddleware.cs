using System.Net;
using System.Text.Json;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    public GlobalExceptionMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            ctx.Response.ContentType = "application/json";
            ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var resp = new { error = ex.Message, stack = ex.StackTrace };
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(resp));
        }
    }
}
