function clone (obj) {
  // Handle the 3 simple types, and null or undefined or function
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
      var copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
  }
  // Handle Array or Object
  if (obj instanceof Array | obj instanceof Object) {
      var copy = (obj instanceof Array)?[]:{};
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr))
              copy[attr] = clone(obj[attr]);
      }
      return copy;
  }
  throw new Error("Unable to clone obj! Its type isn't supported.");
}
function getRandomString( len ) {
  　　len = len || 4;
  　　let $chars = 'abcdefhijkmnprstwxyz123456789';
      let maxPos = $chars.length;
  　　let pwd = '';
  　　for (let i = 0; i < len; i++) {
  　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  　　}
  　　return pwd;
};
export {
  clone,getRandomString
}
