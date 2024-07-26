class Reaction {
    constructor(
        
        user_id,
        like, 
        comment ,
        createdAt,
        updatedAt
        
    ) {
        
        this.user_id = user_id
        this.like = like
        this.comment= comment
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }
}
module.exports = { Reaction }