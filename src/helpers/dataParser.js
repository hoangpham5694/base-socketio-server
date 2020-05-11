
module.exports = class DataParser {

    parseRoomMember(roomMember){
        return {
            id : roomMember.id,
            user_id : roomMember.user_id,
            room_id : roomMember.room_id,
            seen_at : roomMember.seen_at,

        }
    }
    parseUserData(userData){
        return {
            id: userData.id,
            profile_image: userData.profile_image,
            nick_name: userData.nick_name,
        }

    }

}
