<template>
<div class="container">
    <div class="image-container">
        <div class="image" v-if="photo != undefined">
            <img :src="photo.path" />
        </div>
        <div class="image-info" v-if="photo != undefined && postedByUser != undefined">
            <h2>{{photo.title}}</h2>
            <p>{{photo.description}}</p>
            <p>Posted by: {{postedByUser.firstName}} {{postedByUser.lastName}}</p>
            <p><i>{{formatDate(photo.created)}}</i></p>
        </div>
    </div>
    <div id="comment-container">
        <div id="add-comment-container" v-if="user">
            <h3>Add a Comment</h3>

            <form v-on:submit.prevent="addComment">
            <textarea v-model="addedComment"></textarea>
            <br>
            <button type="submit">Comment</button>
            </form>
        </div>
        <h3>Comments</h3>

        <div v-for="comment in comments" :key="comment.id">
            <hr>
            <p>{{comment.comment}}</p>
            <p v-if="comment.user != undefined"><i>-- {{comment.user.firstName}} {{comment.user.lastName}}</i></p>
            <p><i>{{comment.date}}</i></p>
        </div>
    </div>
</div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
export default {
    name: "PhotoView",
    data() {
        return {
            photo: null,
            postedByUserID: "",
            comments: {},
            addedComment: "",
            postedByUser: null
        }
    },
    async created() {
        try {
            let response = await axios.get('/api/users');
            this.$root.$data.user = response.data.user;
        } catch (error) {
            this.$root.$data.user = null;
        }
        this.getPhoto();
        this.getComments();
    },
    computed: {
        user() {
            return this.$root.$data.user;
        },
    },
    methods: {
        async getPhoto() {
            try {
                this.response = await axios.get("/api/photos/" + this.$route.params.id);
                this.photo = this.response.data;
                this.postedByUserID = this.photo.user;
                await this.getPostedByUser();
            } catch (error) {
                this.error = error.response.data.message;
            }
        },
        formatDate(date) {
            if (moment(date).diff(Date.now(), 'days') < 15)
                return moment(date).fromNow();
            else
                return moment(date).format('d MMMM YYYY');
        },
        async addComment() {
            try {
                await axios.post("/api/comments/" + this.$route.params.id, {
                    user: {
                        firstName: this.user.firstName,
                        lastName: this.user.lastName
                    },
                    photo: this.photo,
                    comment: this.addedComment,
                    date: this.formatDate(Date.now())
                })
                this.addedComment = ""
            } catch (error) {
                console.log(error);
                this.error = error.response.data.message;
            }
            this.getComments();
        },
        async getComments() {
            // console.log("In get comments");
            try {
                this.response = await axios.get("/api/comments/" + this.$route.params.id);
                this.comments = this.response.data;
            } catch (error){
                this.error = error.response.data.message;
            }
            // console.log("Exiting get comments");
            this.getCommentPosters();
        },
        async getPostedByUser() {
            try {
                this.response = await axios.get("/api/users/" + this.postedByUserID);
                this.postedByUser = this.response.data;
            } catch (error) {
                this.error = error.response.data.message;
            }
        },
        async getCommentPosters() {
            for (let i = 0; i < this.comments.length; i++){
                let comment = this.comments[i];
                // console.log(comment);
                let userReturned = await this.getCommentPoster(comment.user);
                // console.log(userReturned);
                comment.firstName = userReturned.firstName;
                comment.lastName = userReturned.lastName;
                // console.log("Read user");
            }
        },
        async getCommentPoster(userID) {
            // console.log("In comment poster");
            try {
                this.response = await axios.get("/api/users/" + userID);
                return this.response.data;
            } catch (error) {
                this.error = error.response.data.message;
            }
        }
    }
}
</script>

<style scoped>
.container {
    display: flex;
    /* border: 2px solid red; */
    align-items: center;
    flex-direction: column;
    margin: 0px;
    padding-top: 125px;
    width: 100%;
}

.image-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    /* border: 2px solid yellow; */
    width: 80%;
    padding: 20px;
    padding-bottom: 10px;
    box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px;
}

.image {
    display: flex;
    /* border: 2px solid blue; */
    width: 100%;
    justify-content: center;
}

.image img {
    width: 100%;
}

.image-info {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-info h2 {
    font-size: 2em;
    margin: 0px;
    padding: 5px;
}

.image-info p {
    font-size: 1.75em;
    /* border: 2px solid purple; */
    margin: 4px;
}

#comment-container {
    display: flex;
    flex-direction: column;
    /* border: 2px solid red; */
    width: 80%;
}

.inline {
    display: block;
    margin: 5px;
}
</style>
