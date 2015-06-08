describe('tyto', function() {
  return describe('crud', function() {
    return it('should be an available function', function() {
      var $addBtn, len;
      $addBtn = $('#add-board');
      len = Tyto.boardList.length;

      /*
        When we click add board, we want to make sure that our board collection
        size increases.
       */
      $addBtn.click();
      return expect(Tyto.boardList.length).to.equal(len + 1);
    });
  });
});
