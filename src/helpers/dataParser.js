
module.exports = class DataParser {

    parseRoomMember(roomMember){
        return {
            id : roomMember.id,
            user_id : roomMember.user_id,
            room_id : roomMember.room_id,
            seen_at : roomMember.seen_at,

        }
    }


}
