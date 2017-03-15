class TreeBuilderAlertProfileObj < TreeBuilder
  def initialize(name, type, sandbox, build = true, assign_to: nil, cat: nil, objects: nil)
    @assign_to = assign_to
    @cat = cat
    @objects = objects
    @cat_tree = true if @assign_to.ends_with?("-tags")
    super(name, type, sandbox, build)
  end

  def override(node, object, _pid, _options)
    node[:title] = (object.name.presence || object.description) unless object.kind_of?(MiddlewareServer)
    node[:hideCheckbox] = false
    node[:select] = @objects.include?(object.id)
    node
  end

  def tree_init_options(_tree_name)
    {
      :expand => true
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(
      :oncheck     => "miqOnCheckHandler",
      :check_url   => "/miq_policy/alert_profile_assign_changed/",
      :checkboxes  => true,
      :cfmeNoClick => true,
      :onclick     => false
    )
  end

  def root_options
    t = @cat_tree ? _("Tags") : ui_lookup(:tables => @assign_to)
    {
      :title        => t,
      :tooltip      => "",
      :icon         => "pficon pficon-folder-open",
      :hideCheckbox => true,
      :cfmeNoClick  => true,
      :expand       => true
    }
  end

  def x_get_tree_roots(count_only, _options)
    obj = if !@assign_to || @assign_to == "enterprise"
            []
          elsif @cat_tree
            @cat ? Classification.find(@cat).entries : []
          else
            @assign_to.camelize.constantize.all
          end
    count_only_or_objects(count_only, obj.sort_by { |o| (o.name.presence || o.description).downcase })
  end
end
