(function() {
    function sum(m, n) {
        var num = Math.floor(Math.random() * (m - n) + n);
        return num
    }
    var aid = sum(1, 1000);
    var cid = sum(1, 100);
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
        }
        var id = s4() + s4() + '' + s4() + '' + s4() + '' + s4() + '' + s4() + s4() + s4();
        return id
    }
    var s = document.createElement("script")
      , h = document.getElementsByTagName("head")[0];
    s.charset = "utf8";
    s.async = true;
    s.src = "http://cloud.zyiis.net:8012/bid?frm=0&ref=&url=http%3A%2F%2Fdd.com%3A8012%2Ftest.html&ti=&lg=en&ic=1&ij=0&pl=3&ml=4&h5=1&atf=21&kw=&ct=1&f=0&so=&ws=1440x2560&top=0&left=0&id=43&rid=77741af75a4c62ccf9fb9b4c9df1db59";
    h.insertBefore(s,h.firstChild)
}
)();