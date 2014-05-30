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
    it "should add tyto data to localStorage using saveBarn", ->
      tytoData =
        dummy: "yes"
        name: "test"
      tyto.prototype.saveBarn JSON.stringify tytoData
      expect(window.localStorage.tyto).to.equal JSON.stringify tytoData
      return
    it "should encode tyto escapes with _encodeJSON", ->
      tytoJSON = """{"hashes":"#"}"""
      expect("""{"hashes":"@tyto-hash"}""")
        .to.equal tyto.prototype._encodeJSON tytoJSON
      return
    it "should decode tyto escapes with _decodeJSON", ->
      tytoJSON = """{"hashes":"@tyto-hash"}"""
      expect("""{"hashes":"#"}""")
        .to.equal tyto.prototype._decodeJSON tytoJSON
      return
    return
  return
