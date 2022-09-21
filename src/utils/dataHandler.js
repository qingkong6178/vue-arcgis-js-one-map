export function changeTreeData(data=[],labelName="label",valueName="value",childrenName="children") {
  if (!data){
    return []
  }else{
    let tree = data;
    let dataHandle = function(dates){
      dates.map(i => {
        i.label = i[labelName];
        i.value = i[valueName];
        if (i[childrenName]) {
          dataHandle(i[childrenName])
        }
      })
    }
    dataHandle(tree);
    return tree;
  }
}
export function formatSearch(se) {
  if (se && se.length > 1) {
    se = se.substr(1);
    let arr = se.split("&");
    let obj = {};
    arr.map((i) => {
      const newArr = i.split("=");
      if (typeof obj[newArr[0]] === "undefined") {
        obj[newArr[0]] = newArr[1];
      }
    })
    return obj;
  }
}
