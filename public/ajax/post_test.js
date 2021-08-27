const url = {}
url.root = '/'
url.api = `${url.root}api/`;
url.post = `${url.api}post/`;
url.heart = (postId) => `${url.post}${postId}/heart/`;
url.reply = (postId) => `${url.post}${postId}/reply/`;

class Replies {
    constructor(fks) {
        this.fks = fks;
    }
    getNum = async () => {
        let replyNum;
        await $.ajax({
            url: url.reply(this.fks['post']),
            type: 'get',
            timeout: 5000,
        })
        .done(async (resultData) => {
            const hash = JSON.parse(resultData);
            replyNum = hash['replies'].length;
        })
        return replyNum;
    }
}

class Post {
    constructor(id, fks, foreignRecords) {
        this.id = id;
        this.fks = fks;
        this.foreignRecords = foreignRecords;

        this.delete();
        this.incrementHeart();
    }
    delete = () => {
        const deleteForm = $(`#post-${this.id} .delete`);
        deleteForm.submit(event => {
            event.preventDefault();
            const sendData = deleteForm.serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {})

            if (!confirm('本当に削除しますか？')) return false;

            // Ajax通信を開始
            $.ajax({
                url: deleteForm.prop('action'),
                type: deleteForm.prop('method'),
                dataType: 'json',
                // フォーム要素の内容をハッシュ形式に変換
                data: JSON.stringify(sendData),
                timeout: 5000,
            })
            .done((resultData) => {
                const postId = resultData['post_id'];
                $(`#post-${postId}`).remove();
            })
            return false;
        })
    }
    incrementHeart = () => {
        const heartDom = $(`#post-${this.id} .heart .material-icons`);
        heartDom.click(event => {
            event.preventDefault();

            // Ajax通信を開始
            $.ajax({
                url: `${url.heart(this.id)}increment/`,
                type: 'post',
                timeout: 5000,
            })
            .done((resultData) => {
                const hashData = JSON.parse(resultData);
                $(`#post-${hashData['id']} .heart > .count`).html(hashData['heart']);
            })
            return false;
        })
    }
}

class Posts {
    constructor() {
        $('#create-post').append(
            `<form method="post" action="${url.post}"></form>`);
        $('#create-post > form').append(
            `<input type="text" name="message" autofocus>`);
        $('#create-post > form').append(`<button>投稿</button>`);
        this.get();
        this.create();
    }
    add = async (post) => {
        const replies = new Replies({ 'post': post['id'] });
        const replyNum = await replies.getNum();

        $('#posts').prepend(`<div id="post-${post['id']}"  class="post"></div>`);
        $(`#post-${post['id']}`).append(
            `<span class="message">${post['message']}</span>`);
        $(`#post-${post['id']}`).append(
            '<div class="bottom-container"></div>');
        $(`#post-${post['id']} .bottom-container`).append(
            `<div class="heart"><span class="material-icons">favorite_border</span><span class="count">${post['heart']}</span></div>`);
        $(`#post-${post['id']} .bottom-container`).append(
            `<a class="reply" href="/post/${post['id']}/reply/"><span class="material-icons">reply</span><span class="count">${replyNum}</span></a>`);
        $(`#post-${post['id']} .bottom-container`).append('<div></div>');
        $(`#post-${post['id']} .bottom-container`).append(
            `<span><form class="delete" method="post" action="${url.post}${post['id']}/delete/"></form></span>`);
        $(`#post-${post['id']} .delete`).append(
            '<button class="material-icons">delete</button>');
        $(`#post-${post['id']} .bottom-container`).append(
            `<span class="write-time">${post['write_time']}</span>`);

        new Post(post['id'], {}, { 'reply': replies });
    }
    get = async () => {
        await $.ajax({
            url: url.post,
            type: 'get',
            timeout: 5000,
        })
        .done(async (resultData) => {
            const hashData = JSON.parse(resultData);
            const posts = hashData['posts'];
            for(let i = 0; i < posts.length; i++) {
                await this.add(posts[i]);
            }
        })
    }
    create = async() => {
        const createForm = $('#create-post > form');
        createForm.submit(async event => {
            event.preventDefault();
            const sendData = createForm.serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {})

            // Ajax通信を開始
            await $.ajax({
            url: createForm.prop('action'),
            type: createForm.prop('method'),
            dataType: 'json',
            data: JSON.stringify(sendData),
            timeout: 5000,
            })
            .done(async (resultData) => {
                await this.add(resultData['post']);
                createForm.find('input[name=message]').val('');
                createForm.find('input[name=message]').focus();
            })
            return false;
        })
    }
}

$(document).ready(async () => {
    new Posts();
});
