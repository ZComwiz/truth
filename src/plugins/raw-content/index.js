module.exports = function rawContentPlugin(context, options) {
  return {
    name: 'raw-content-plugin',
    async contentLoaded({content, actions}) {
      const {createData, addRoute} = actions;
      
      // Create an endpoint that returns raw content
      addRoute({
        path: '/raw-content/:bookId/:version',
        component: '@site/src/components/RawContent',
        modules: {
          content: await createData(
            'raw-content.json',
            JSON.stringify(content)
          ),
        },
      });
    },
  };
}; 