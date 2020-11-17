module.exports = {
    create_bucket : (file, fileName) => {
        const fs = require('fs');
        // const contentDisposition = require('content-disposition');

        const params = {
            Bucket: 'sejun-redux-mall',
            Key: 'img/goods/' + fileName,
            ACL: 'public-read', /* 권한: 도메인에 객체경로 URL 을 입력하여 접근 가능하게 설정 */
            Body: fs.readFileSync(file),
            ContentType: 'image/png',
            CacheControl: "no-cache"
        }

        return params;
    },
}