describe "tyto", ->
  describe "tyto initialization", ->
    it "should be available as a function", ->
      expect(typeof(window.tyto)).to.equal "function"
      return
    return
  describe "tyto actions", ->
    it "should remove tyto data from localStorage using deleteSave", ->
      window.localStorage.setItem "tyto", {}
      tyto.prototype.deleteSave()
      expect(typeof(window.localStorage.tyto)).to.equal "undefined"
      return
    return
  return
