# Local-dev shim: Ruby 3.2+ removed Object#tainted?, but Liquid 4.0.3 (locked
# by the github-pages gem) still calls it. GitHub Pages runs in safe mode and
# ignores _plugins/, so this file only kicks in for `bundle exec jekyll serve`.
unless "".respond_to?(:tainted?)
  class Object
    def tainted?
      false
    end

    def untaint
      self
    end
  end
end
