const url = {}
url.root = '/'
url.api = `${url.root}api/`;
url.post = `${url.api}post/`;
url.heart = (postId) => `${url.post}${postId}/heart/`;
url.reply = (postId) => `${url.post}${postId}/reply/`;

// 返信一覧に関しての管理を行う
class Replies {
    constructor(fks) {
        // 外部キー
        this.fks = fks;
    }
    // 1件の投稿の返信数を取得する
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

// 1件の投稿に関しての管理を行う
class Post {
    constructor(id, fks) {
        // id
        this.id = id;
        // 外部キー
        this.fks = fks;

        // 処理が来るまで待機するメソッドを実行しておく
        this.delete();
        this.incrementHeart();
    }

    // 削除ボタンが押されたら、該当する投稿を削除する
    delete = () => {
        const deleteForm = $(`#post-${this.id} .delete`);
        deleteForm.submit(event => {
            event.preventDefault();
            const sendData = deleteForm.serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {})

            // 削除するかどうかを尋ねて、はいが押された場合のみ削除処理に移る
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
                // 投稿一覧表示から投稿を削除する
                const postId = resultData['post_id'];
                $(`#post-${postId}`).remove();
            })
            return false;
        })
    }

    // いいねボタンが押されたら、該当する投稿のいいね数を増やす
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
                // いいね数の表示を変更
                const hashData = JSON.parse(resultData);
                $(`#post-${hashData['id']} .heart > .count`).html(hashData['heart']);
            })
            return false;
        })
    }
}

// 投稿一覧に関しての管理を行う
class Posts {
    constructor(fks) {
        this.fks = fks;
        $('#create-post').append(
            `<form method="post" action="${url.post}"></form>`);
        $('#create-post > form').append(
            `<input type="text" name="message" autofocus>`);
        $('#create-post > form').append(`<button>投稿</button>`);

        this.get();

        // 処理が来るまで待機するメソッドを実行しておく
        this.create();
    }

    // 投稿を投稿一覧表示に追加
    add = async (post) => {
        // 返信数を取得
        const replies = new Replies({ 'post': post['id'] });
        const replyNum = await replies.getNum();

        // DOMに投稿を追加
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

        // 各投稿に対して処理を行うクラスを呼び出す
        new Post(post['id'], this.fks, { 'reply': replies });
    }

    // 投稿一覧を取得
    get = async () => {
        // Ajax通信を開始
        await $.ajax({
            url: url.post,
            type: 'get',
            timeout: 5000,
        })
        .done(async (resultData) => {
            const hashData = JSON.parse(resultData);
            const posts = hashData['posts'];

            // 投稿一覧を上から最新順になるようにDOMに追加
            for(let i = 0; i < posts.length; i++) {
                await this.add(posts[i]);
            }
        })
    }

    // 投稿作成フォームが作成されたら、投稿を作成する
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
                // 投稿を投稿一覧表示に追加
                await this.add(resultData['post']);

                // 投稿作成フォームのリセット
                createForm.find('input[name=message]').val('');
                createForm.find('input[name=message]').focus();
            })
            return false;
        })
    }
}

// 画面読み込み後の処理
$(document).ready(async () => {
    new Posts({});
});
