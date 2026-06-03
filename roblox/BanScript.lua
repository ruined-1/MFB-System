local HttpService = game:GetService("HttpService")

local API_URL = "https://YOUR-RENDER-URL/api/checkBan"
local API_KEY = "YOUR_API_KEY"

local function isBanned(userId)
    local response
    local success, err = pcall(function()
        response = HttpService:PostAsync(
            API_URL,
            HttpService:JSONEncode({ userId = userId }),
            Enum.HttpContentType.ApplicationJson,
            false,
            { ["Authorization"] = API_KEY }
        )
    end)

    if not success then
        warn("Ban check failed:", err)
        return false
    end

    local data = HttpService:JSONDecode(response)
    return data.banned, data.reason, data.moderator
end

game.Players.PlayerAdded:Connect(function(player)
    local banned, reason, moderator = isBanned(player.UserId)
    if banned then
        player:Kick("You are banned.\nReason: " .. reason .. "\nModerator: " .. moderator)
    end
end)
