class Post {
    constructor(
        user_id,
        text,
        file,
        visibility,
        createdAt,
        updatedAt
        
    ) { 
        this.user_id = user_id
        this.text = text
        this.file = file
        this.visibility = visibility
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }
}
module.exports = { Post }